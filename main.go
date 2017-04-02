package main

import (
  "net/http"
)

func main() {
  fs := http.FileServer(http.Dir("static"))
  http.Handle("/", fs)
  http.ListenAndServe(":9112", nil)
}

