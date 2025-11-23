package com.example.machineservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TBL_MACHINE_SERVICE")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MachineService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "machine_id")
    private MachineInfo machineInfo;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private ServiceType serviceType;

    private LocalDateTime createDate;
}
