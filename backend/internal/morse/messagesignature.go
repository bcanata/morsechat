package morse

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
)

// SignedMessage represents the struct we will encrypt/decrypt
type SignedMessage struct {
	Session   string    `json:"s"`
	PlainText string    `json:"p"`
	Username string    `json:"u"`
	Callsign string    `json:"c"`
  //Note: javascript does not handle int values > 2^32 when decoding json
  //We can safely json encode this int64 only because it is never
  //parsed by javascript. The json blobs generated from here will only
  //be decoded by golang code.
  Timestamp int64      `json:"t"`
}

// encryptMessage encrypts the SignedMessage struct with the given secret key
func EncryptMessage(msg SignedMessage, secretKey []byte) (string, error) {
	plainText, err := json.Marshal(msg)
	if err != nil {
		return "", fmt.Errorf("mesajı serileştirme başarısız: %v", err)
	}

	// Yeni bir AES şifre bloğu oluşturun
	block, err := aes.NewCipher(secretKey)
	if err != nil {
		return "", fmt.Errorf("şifre oluşturma başarısız: %v", err)
	}

	// Şifreleme için GCM (Galois/Counter Mode) kullanın
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("GCM oluşturma başarısız: %v", err)
	}

	// Rastgele bir nonce oluşturun
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("nonce oluşturma başarısız: %v", err)
	}

	// Düz metni şifreleyin ve nonce ekleyin
	cipherText := gcm.Seal(nonce, nonce, plainText, nil)

	// Şifreli metni base64 stringine kodlayın
	return base64.StdEncoding.EncodeToString(cipherText), nil
}

// decryptMessage decrypts the message string with the given secret key
func DecryptMessage(encryptedMessage string, secretKey []byte) (SignedMessage, error) {
	var msg SignedMessage

	// Base64 kodlu mesajı çöz
	cipherText, err := base64.StdEncoding.DecodeString(encryptedMessage)
	if err != nil {
		return msg, fmt.Errorf("base64 mesajını çözme başarısız: %v", err)
	}

	// Yeni bir AES şifre bloğu oluşturun
	block, err := aes.NewCipher(secretKey)
	if err != nil {
		return msg, fmt.Errorf("şifre oluşturma başarısız: %v", err)
	}

	// Şifre çözme için GCM (Galois/Counter Mode) kullanın
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return msg, fmt.Errorf("GCM oluşturma başarısız: %v", err)
	}

	// Şifreli metinden nonce çıkarın
	nonceSize := gcm.NonceSize()
	if len(cipherText) < nonceSize {
		return msg, fmt.Errorf("şifreli metin çok kısa")
	}
	nonce, cipherText := cipherText[:nonceSize], cipherText[nonceSize:]

	// Şifreli metni çöz
	plainText, err := gcm.Open(nil, nonce, cipherText, nil)
	if err != nil {
		return msg, fmt.Errorf("mesajı çözme başarısız: %v", err)
	}

	// JSON'u SignedMessage yapısına serileştirin
	if err := json.Unmarshal(plainText, &msg); err != nil {
		return msg, fmt.Errorf("mesajı serileştirme başarısız: %v", err)
	}

	return msg, nil
}
