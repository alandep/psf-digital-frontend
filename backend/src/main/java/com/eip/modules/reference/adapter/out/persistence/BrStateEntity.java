package com.eip.modules.reference.adapter.out.persistence;

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
    private String uf;

    @Column(name = "ibge_code")
    private String ibgeCode;

    private String name;
}
