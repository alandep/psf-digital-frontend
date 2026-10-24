package com.eip.modules.admin.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Admin-module view of the {@code app_user} table for public signup. */
@Entity(name = "AdminAppUser")
@Table(name = "app_user")
@Getter
@Setter
@NoArgsConstructor
public class AdminAppUserEntity {

    @Id
    private UUID id;

    private String name;

    private String email;

    @Column(name = "cpf_lookup_hash")
    private String cpfLookupHash;

    @Column(name = "cpf_ciphertext")
    private String cpfCiphertext;

    private String phone;

    private String status;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;

    @Column(name = "login_count")
    private int loginCount;
}