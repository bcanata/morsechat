# <img src="https://i.imgur.com/A8fVeyP.png" height="60"> Morsechat 

[![Website](https://img.shields.io/website?down_message=offline&up_message=up&url=https%3A%2F%2Fmorse.halb.it)](https://morse.halb.it)
[![Online](https://img.shields.io/badge/dynamic/json?label=online%20users&query=%24.online_users&url=https%3A%2F%2Fmorse.halb.it%2Fapi%2Fv1%2Fpublic_stats)](https://morse.halb.it)
[![Channels](https://img.shields.io/badge/dynamic/json?label=active%20channels&query=%24.active_channels&url=https%3A%2F%2Fmorse.halb.it%2Fapi%2Fv1%2Fpublic_stats)](https://morse.halb.it)
![license](https://img.shields.io/github/license/robalb/morsechat.svg)
[![Grade](https://img.shields.io/mozilla-observatory/grade/morse.halb.it?publish)](https://observatory.mozilla.org/analyze/morse.halb.it)

[![Discord](https://img.shields.io/discord/842882128555016212?label=Discord%20community)](https://discord.gg/JNwsmHuKwd)

Dünyanın her yerinden kullanıcıların morse kodunda pratik yapmasına ve pahalı ekipmanlara ihtiyaç duymadan iletişim kurmasına olanak tanıyan çevrimiçi bir morse kodu sohbeti. [morse.halb.it](https://morse.halb.it/) adresinde canlı

## ekran görüntüleri
<p align="center">
<img src="./docs/tablet_a.png" width="600px" height="auto" />
<img src="./docs/phone.png" width="190px" height="auto" />
</p>

<!--
w 600 200
h 500 400
-->

## yapılandırma

env.example dosyasını .env olarak kopyalayın

.env dosyasında uygulama gizli anahtarınızı yapılandırın


## geliştirme

bu depoyu klonlayın `git clone https://github.com/robalb/morsechat.git`

depo içine gidin `cd morsechat`

arka uç sunucusunu geliştirme modunda başlatın `cd backend && go run -race cmd/morsechat/main.go`

vite'i geliştirme modunda başlatın `cd web && npm run dev`

Bu adımlar uygulamanın yerel bir sürümünü çalıştırmak için yeterlidir.
Arka uç aynı zamanda birim, uçtan uca ve fuzz testleri de içerir, bunları `go test ./...` komutuyla çalıştırabilirsiniz

## üretim

Web uygulamasını bir üretim ortamında çalıştırmanın en kolay yolu sağlanan docker-compose.yml dosyasını kullanmaktır,
`docker-compose up --build`


Alternatif olarak, `kubernetes/base` dizinindeki bildirimleri kullanarak uygulamayı bir k8s kümesine dağıtabilirsiniz, ancak öncelikle
kendi traefik ingress kontrolcünüzü ve certmanager'ınızı kurmanız gerekecektir.
Arka uç web sunucusu, proxy protokolü etkinleştirilmiş bir ingress'ten gelen X-Forwarder-For başlıklarını işleyecek şekilde yapılandırılmıştır.
Bunu flaskapp.conf dosyasında yapılandırabilirsiniz

halb.it'teki canlı web sitesi github iş akışları kullanılarak oluşturulur ve argoCD ile bir k8s kümesine dağıtılır

