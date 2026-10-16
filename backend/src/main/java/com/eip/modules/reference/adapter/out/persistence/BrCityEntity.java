package com.eip.modules.reference.adapter.out.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** JPA entity for the global {@code br_city} reference table (IBGE municipios). */
@Entity
@Table(name = "br_city")
@Getter
@Setter
@NoArgsConstructor
public class BrCityEntity {

    @Id
    @Column(name = "ibge_code")
    private String ibgeCode;

    private String uf;

    private String name;
}
