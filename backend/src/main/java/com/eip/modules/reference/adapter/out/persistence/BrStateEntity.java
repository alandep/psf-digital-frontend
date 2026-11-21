package com.eip.modules.reference.adapter.out.persistence;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** JPA entity for the global {@code br_state} reference table (Brazilian UFs). */
@Entity
@Table(name = "br_state")
@Getter
@Setter
@NoArgsConstructor
public class BrStateEntity {

    @Id
    @JdbcTypeCode(SqlTypes.CHAR) @Column(length = 2) private String uf;

    @JdbcTypeCode(SqlTypes.CHAR) @Column(name = "ibge_code", length = 2)
    private String ibgeCode;

    private String name;
}
