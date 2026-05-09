package com.acadly.backend.service;

import com.acadly.backend.entity.Curso;
import com.acadly.backend.entity.Horario;
import com.acadly.backend.repository.CursoRepository;
import com.acadly.backend.repository.HorarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HorarioService {

    private final HorarioRepository horarioRepo;
    private final CursoRepository cursoRepo;

    public HorarioService(
            HorarioRepository horarioRepo,
            CursoRepository cursoRepo
    ) {
        this.horarioRepo = horarioRepo;
        this.cursoRepo = cursoRepo;
    }

    // CREAR
    public Horario crear(Long cursoId, Horario horario) {

        Curso curso = cursoRepo.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        // Validación de horario
        if (horario.getHoraFin().isBefore(horario.getHoraInicio())) {
            throw new RuntimeException("La hora fin no puede ser menor");
        }

        horario.setCurso(curso);

        return horarioRepo.save(horario);
    }

    // TODOS
    public List<Horario> obtenerTodos() {
        return horarioRepo.findAll();
    }

    // POR ID
    public Horario obtenerPorId(Long id) {
        return horarioRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Horario no encontrado"));
    }

    // POR CURSO
    public List<Horario> obtenerPorCurso(Long cursoId) {
        return horarioRepo.findByCursoId(cursoId);
    }

    // UPDATE
    public Horario actualizar(Long id, Horario datos) {

        Horario horario = horarioRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Horario no encontrado"));

        horario.setDiaSemana(datos.getDiaSemana());
        horario.setHoraInicio(datos.getHoraInicio());
        horario.setHoraFin(datos.getHoraFin());
        horario.setAula(datos.getAula());

        return horarioRepo.save(horario);
    }

    // DELETE
    public void eliminar(Long id) {

        Horario horario = horarioRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Horario no encontrado"));

        horarioRepo.delete(horario);
    }
}