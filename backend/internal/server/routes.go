package server

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/jwtauth/v5"
	"github.com/robalb/morsechat/internal/auth"
	"github.com/robalb/morsechat/internal/config"
	"github.com/robalb/morsechat/internal/middleware"
)


func AddRoutes(
  rootMux *chi.Mux,
  logger *log.Logger,
  config config.Config,
  hub *Hub,
  tokenAuth *jwtauth.JWTAuth,
  /* Put here all the dependencies for middlewares and routers */
){
  rootMux.Get("/", serveHome)

  ws := chi.NewRouter()
  rootMux.Mount("/ws", ws)
  ws.Use(middleware.RequireValidSession(tokenAuth)) 
  ws.Get("/init", func(w http.ResponseWriter, r *http.Request) {
    //This is the only handler that accepts session jwts with anonymous data
    serveWs(hub, w, r)
  })

  v1 := chi.NewRouter()
  rootMux.Mount("/api/v1", v1)

  //Non authenticated routes
  v1.Group(func(r chi.Router){
    r.Post("/register", serveTODO)
    r.Post("/login", serveLoginTest(tokenAuth))
    r.Post("/sess_init", serveTODO) //the first api call. will set a session jwt with anonymous data.
    r.Post("/validate_callsign", serveTODO)
  })

  //Authenticated routes
  v1.Group(func(r chi.Router){
   	r.Use(middleware.RequireValidSession(tokenAuth)) 

    r.Route("/moderator", func(r chi.Router) {
      r.Use(middleware.RequireModerator(tokenAuth)) 
      r.Get("/list_banned", serveTODO)
      r.Post("/ban", serveTODO)
      r.Post("/unbann", serveTODO)
    })
    r.Route("/admin", func(r chi.Router) {
      r.Use(middleware.RequireAdmin(tokenAuth)) 
      r.Get("/list_moderators", serveTODO)
      r.Post("/set_moderator", serveTODO)
      r.Post("/remove_moderator", serveTODO)
      r.Get("/list_ban_activity", serveTODO)
    })

    r.Route("/chat", func(r chi.Router) {
      r.Get("/report", serveTODO)
    })
  })

  //TODO remove
  v1.Route("/test", func(r chi.Router) {
    r.Get("/time", serveTestCtx)
    r.Get("/ping", serveTest)
  })

}



//TODO: move to dedicated file anything below this line
//---------

func serveLoginTest(tokenAuth *jwtauth.JWTAuth) func(w http.ResponseWriter, r *http.Request){
  return func(w http.ResponseWriter, r *http.Request){
    _, tokenString, _ := tokenAuth.Encode(map[string]interface{}{"user_id": 123})
    jwtData := auth.JwtData{
      UserId: 0, 
      IsAnonymous: true,
      IsAdmin:false,
      IsModerator:false,
      Username: "foo",
      Callsign: "US000X",
    }
    expiration := time.Hour * 24 * 30
    tokenString, err := auth.EncodeJwt(tokenAuth, jwtData, expiration)
    if err != nil {
    fmt.Printf("err: %v", err.Error())
      
    }
    fmt.Printf("token: %v |", tokenString)
  }
}


func serveHome(w http.ResponseWriter, r *http.Request) {
	log.Println(r.URL)
	if r.URL.Path != "/" {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	http.ServeFile(w, r, "home.html")
}

func serveTest(w http.ResponseWriter, r *http.Request) {
	tr := &http.Transport{
		IdleConnTimeout:    1 * time.Second,
		DisableCompression: true,
	}
	client := &http.Client{Transport: tr}
	resp, err := client.Get("https://halb.it")
	if err != nil {
		log.Println("err")
		log.Println(err)
	} else {
		log.Println(resp)
	}
}

func serveTestCtx(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	select {
	case <-ctx.Done():
    log.Println("ctx done, abrupt end. reason:")
		log.Println(ctx.Err())
		http.Error(w, ctx.Err().Error(), http.StatusInternalServerError)
	case <-time.After(4 * time.Second):
		log.Println("10s elapsed")
    fmt.Fprintf(w, "10s elapsed")
	}

}


func serveTODO(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "Api endpoint not implemented", http.StatusInternalServerError)
}
