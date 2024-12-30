package server

import (
	"context"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"time"

	"github.com/go-chi/jwtauth/v5"
	"github.com/robalb/morsechat/internal/config"
	"github.com/robalb/morsechat/internal/db"
	"github.com/robalb/morsechat/internal/wsserver"

	_ "github.com/mattn/go-sqlite3"
)

func Run(
	ctx context.Context,
	stdout io.Writer,
	stderr io.Writer,
	args []string,
	getenv func(string) string,
) error {
	ctx, cancel := signal.NotifyContext(ctx, os.Interrupt)
	defer cancel()

	//--------------------
	// Her şeyi başlat
	//--------------------
	// Günlük kaydını başlat
	logger := log.New(stdout, "", log.Flags())
	logger.Println("başlatılıyor... ")
	// Yapılandırmayı başlat
	config, err := config.MakeConfig(args, getenv)
  if err != nil {
		logger.Printf("Uygulama yapılandırması başlatılamadı: %v", err.Error())
		return err
  }
	// JWT kimlik doğrulamasını başlat
	tokenAuth := jwtauth.New("HS256", config.SecretBytes, nil)
	// Veritabanını başlat
	dbReadPool, err := db.NewReadPool(config.SqlitePath, ctx)
	if err != nil {
		logger.Printf("Veritabanı okuma havuzu başlatılamadı: %v", err.Error())
		return err
	}
	dbWritePool, err := db.NewWritePool(config.SqlitePath, ctx)
	if err != nil {
		logger.Printf("Veritabanı yazma havuzu başlatılamadı: %v", err.Error())
		return err
	}
	err = db.ApplyMigrations(dbWritePool, ctx)
	if err != nil {
		logger.Printf("Veritabanı geçişleri uygulanamadı: %v", err.Error())
		return err
	}
	// Websocket hub'ını başlat
	hub := wsserver.New()
	go hub.Run(
    ctx,
    logger,
    &config,
    dbReadPool,
    dbWritePool,
  )
	// Sunucuyu başlat
	srv := NewServer(
		logger,
		&config,
		hub,
		tokenAuth,
		dbReadPool,
		dbWritePool,
	)
	httpServer := &http.Server{
		Addr:    net.JoinHostPort(config.Host, config.Port),
		Handler: srv,
	}

	//--------------------
	// Web sunucusunu başlat
	//--------------------
	go func() {
		logger.Printf("%s adresinde dinleniyor\n", httpServer.Addr)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Fprintf(stderr, "dinleme ve hizmet verme hatası: %s\n", err)
		}
	}()

	//--------------------
	// Zarif kapatma
	//--------------------
	var wg sync.WaitGroup
	// Web sunucusunun zarif kapatılması
	//TODO: websocket'leri kapat. Kapatma websocket'leri kapatmaz
	wg.Add(1)
	go func() {
		defer wg.Done()
		<-ctx.Done()
		logger.Println("Web sunucusu zarif bir şekilde kapatılıyor...")
		shutdownCtx := context.Background()
		shutdownCtx, cancel := context.WithTimeout(shutdownCtx, 10*time.Second)
		defer cancel()
		if err := httpServer.Shutdown(shutdownCtx); err != nil {
			fmt.Fprintf(stderr, "http sunucusu kapatma hatası: %s\n", err)
		}
	}()
	//örnek zarif kapatma (örneğin bir veritabanı için kullanılabilir)
	wg.Add(1)
	go func() {
		defer wg.Done()
		<-ctx.Done()
		logger.Println("Test modülü zarif bir şekilde kapatılıyor...")
	}()

	wg.Wait()
	return nil
}
