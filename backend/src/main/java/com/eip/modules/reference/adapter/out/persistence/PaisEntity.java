package com.eip.modules.reference.adapter.out.persistence;

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
    private String alpha2;

    private String alpha3;

    @Column(name = "numeric_code")
    private String numericCode;

    @Column(name = "name_pt")
    private String namePt;

    @Column(name = "name_en")
    private String nameEn;
}
