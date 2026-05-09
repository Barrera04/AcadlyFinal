package com.acadly.backend.repository;

import com.acadly.backend.entity.Horario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HorarioRepository extends JpaRepository<Horario, Long> {

    List<Horario> findByCursoId(Long cursoId);

}