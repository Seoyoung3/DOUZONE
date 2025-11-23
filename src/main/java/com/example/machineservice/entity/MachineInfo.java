package com.example.machineservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "TBL_MACHINE_INFO")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MachineInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String line;
    private String stationName;
    private String deviceType;
    private String locationType;
    private String floor;
    private String detailLocation;
    private Integer deviceCount;
    private String contractor;
    private String phone;
    private Double latitude;
    private Double longitude;

    @Column(nullable = false)
    private LocalDateTime createDate;
    private LocalDateTime modifyDate;

    @OneToMany(mappedBy = "machineInfo", cascade = CascadeType.ALL)
    private List<MachineService> machineServices;
}
