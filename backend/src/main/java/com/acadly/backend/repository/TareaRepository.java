package com.acadly.backend.repository;

import com.acadly.backend.entity.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TareaRepository extends JpaRepository<Tarea, Long> {

    List<Tarea> findByCursoId(Long cursoId);

}