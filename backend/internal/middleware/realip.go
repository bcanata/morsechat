package middleware

// Ported from Goji's middleware, source:
// https://github.com/zenazn/goji/tree/master/web/middleware

import (
	"net"
	"net/http"
	"strings"
)

var defaultHeaders = []string{
	"True-Client-IP", // Cloudflare Enterprise plan
	"X-Real-IP",
	"X-Forwarded-For",
}

// RealIP is a middleware that sets a http.Request's RemoteAddr to the results
// of parsing either the True-Client-IP, X-Real-IP or the X-Forwarded-For headers
// (in that order).
//
// This middleware should be inserted fairly early in the middleware stack to
// ensure that subsequent layers (e.g., request loggers) which examine the
// RemoteAddr will see the intended value.
//
// You should only use this middleware if you can trust the headers passed to
// you (in particular, the three headers this middleware uses), for example
// because you have placed a reverse proxy like HAProxy or nginx in front of
// chi. If your reverse proxies are configured to pass along arbitrary header
// values from the client, or if you use this middleware without a reverse
// proxy, malicious clients will be able to make you very sad (or, depending on
// how you're using RemoteAddr, vulnerable to an attack of some sort).
func RealIP(h http.Handler) http.Handler {
	fn := func(w http.ResponseWriter, r *http.Request) {
		if rip := getRealIP(r, defaultHeaders); rip != "" {
			r.RemoteAddr = rip
		}
		h.ServeHTTP(w, r)
	}

	return http.HandlerFunc(fn)
}

// RealIPFromHeaders is a middleware that sets a http.Request's RemoteAddr to the results
// of parsing the custom headers.
//
// usage:
// r.Use(RealIPFromHeaders("CF-Connecting-IP"))
func RealIPFromHeaders(headers ...string) func(http.Handler) http.Handler {
	f := func(h http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			if rip := getRealIP(r, headers); rip != "" {
				r.RemoteAddr = rip
			}
			h.ServeHTTP(w, r)
		}
		return http.HandlerFunc(fn)
	}
	return f
}

func getRealIP(r *http.Request, headers []string) string {
	for _, header := range headers {
		if ip := r.Header.Get(header); ip != "" {
			ips := strings.Split(ip, ",")
			if ips[0] == "" || net.ParseIP(ips[0]) == nil {
				continue
			}
			return ips[0]
		}
	}
	return ""
}