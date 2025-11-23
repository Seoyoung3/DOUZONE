// 특정 데이터를 찾지 못했을 때 사용 

package com.example.machineservice.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}