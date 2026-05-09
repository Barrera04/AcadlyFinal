package com.acadly.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/test")
    public String test() {
        return "Conexión exitosa: El backend de Acadly está respondiendo correctamente.";
    }
}