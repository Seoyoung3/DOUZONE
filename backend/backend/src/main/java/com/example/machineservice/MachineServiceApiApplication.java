// Spring Boot 애플리케이션 시작시키는 메인 클래스 

package com.example.machineservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/* MongoDB만 쓰기 때문에 JPA는 필요 없음.
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration; 

@SpringBootApplication(exclude = {
        DataSourceAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class
})
*/

@SpringBootApplication
public class MachineServiceApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(MachineServiceApiApplication.class, args);
    }
}
