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

/** JPA entity for the global {@code country} reference table (ISO 3166-1). */
@Entity
@Table(name = "country")
@Getter
@Setter
@NoArgsConstructor
public class PaisEntity {

    @Id
    @JdbcTypeCode(SqlTypes.CHAR) @Column(length = 2) private String alpha2;

    @JdbcTypeCode(SqlTypes.CHAR) @Column(length = 3) private String alpha3;

    @JdbcTypeCode(SqlTypes.CHAR) @Column(name = "numeric_code", length = 3)
    private String numericCode;

    @Column(name = "name_pt")
    private String namePt;

    @Column(name = "name_en")
    private String nameEn;
}
