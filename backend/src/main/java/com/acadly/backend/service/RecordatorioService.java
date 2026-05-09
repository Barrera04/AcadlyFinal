package com.acadly.backend.service;

import com.acadly.backend.entity.Recordatorio;
import com.acadly.backend.entity.Tarea;
import com.acadly.backend.repository.RecordatorioRepository;
import com.acadly.backend.repository.TareaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecordatorioService {

    private final RecordatorioRepository recordatorioRepo;
    private final TareaRepository tareaRepo;

    public RecordatorioService(
            RecordatorioRepository recordatorioRepo,
            TareaRepository tareaRepo
    ) {
        this.recordatorioRepo = recordatorioRepo;
        this.tareaRepo = tareaRepo;
    }

    // CREAR
    public Recordatorio crear(Long tareaId, Recordatorio recordatorio) {

        Tarea tarea = tareaRepo.findById(tareaId)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        recordatorio.setTarea(tarea);

        return recordatorioRepo.save(recordatorio);
    }

    // TODOS
    public List<Recordatorio> obtenerTodos() {
        return recordatorioRepo.findAll();
    }

    // POR ID
    public Recordatorio obtenerPorId(Long id) {
        return recordatorioRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Recordatorio no encontrado"));
    }

    // POR TAREA
    public List<Recordatorio> obtenerPorTarea(Long tareaId) {
        return recordatorioRepo.findByTareaId(tareaId);
    }

    // UPDATE
    public Recordatorio actualizar(Long id, Recordatorio datos) {

        Recordatorio recordatorio = recordatorioRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Recordatorio no encontrado"));

        recordatorio.setFechaRecordatorio(datos.getFechaRecordatorio());
        recordatorio.setEnviado(datos.getEnviado());

        return recordatorioRepo.save(recordatorio);
    }

    // DELETE
    public void eliminar(Long id) {

        Recordatorio recordatorio = recordatorioRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Recordatorio no encontrado"));

        recordatorioRepo.delete(recordatorio);
    }
}