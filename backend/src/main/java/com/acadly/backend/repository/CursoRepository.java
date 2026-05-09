package com.acadly.backend.repository;

import com.acadly.backend.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CursoRepository extends JpaRepository<Curso, Long> {

    List<Curso> findByUsuarioId(Long usuarioId);

}