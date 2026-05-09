package com.acadly.backend.entity;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "recordatorios")
public class Recordatorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔥 Relación con tarea
    @ManyToOne(optional = false)
    @JoinColumn(name = "tarea_id", nullable = false)
    private Tarea tarea;

    @Column(name = "fecha_recordatorio", nullable = false)
    private OffsetDateTime fechaRecordatorio;

    @Column(nullable = false)
    private Boolean enviado;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public Recordatorio() {
    }

    @PrePersist
    public void prePersist() {

        this.createdAt = OffsetDateTime.now();

        if (this.enviado == null) {
            this.enviado = false;
        }
    }

    // ===== GETTERS =====

    public Long getId() {
        return id;
    }

    public Tarea getTarea() {
        return tarea;
    }

    public OffsetDateTime getFechaRecordatorio() {
        return fechaRecordatorio;
    }

    public Boolean getEnviado() {
        return enviado;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    // ===== SETTERS =====

    public void setId(Long id) {
        this.id = id;
    }

    public void setTarea(Tarea tarea) {
        this.tarea = tarea;
    }

    public void setFechaRecordatorio(OffsetDateTime fechaRecordatorio) {
        this.fechaRecordatorio = fechaRecordatorio;
    }

    public void setEnviado(Boolean enviado) {
        this.enviado = enviado;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}