package handlers

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/robalb/morsechat/internal/config"
	"github.com/robalb/morsechat/internal/morse"
	"github.com/robalb/morsechat/internal/validation"
)

type ServeReport_req struct {
  Text string   `json:"text" validate:"required,min=1"`
  Signature string   `json:"signature" validate:"required,min=1"` //TODO
}
func ServeReport(
	logger *log.Logger,
  config *config.Config,
	dbReadPool *sql.DB,
	dbWritePool *sql.DB,
) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var req ServeReport_req
		if err := validation.Bind(w, r, &req); err != nil {
			//Error response is already set by Bind
			return
		}
    signedMessage, err := morse.DecryptMessage(req.Signature, config.SecretBytes)
    if err != nil{
			validation.RespondError(w, "İşleme başarısız", "", http.StatusInternalServerError)
			logger.Printf("ServeReport: imza şifre çözme başarısız : %v", err.Error())
      return
    }
    logger.Printf("ServeReport: bildirildi : %v", signedMessage)
    validation.RespondOk(w, OkResponse{Ok: "tamam"})
  }
}
