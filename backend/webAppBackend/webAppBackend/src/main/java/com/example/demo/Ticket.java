package com.example.demo;

public class Ticket {
    private Long id;
    private String code;
    private boolean checkedIn;

    public Ticket(Long id, String code) {
        this.id = id;
        this.code = code;
        this.checkedIn = false;
    }

    public Long getId() { 
        return id; 
    }

    public String getCode() { 
        return code; 
    }

    public boolean isCheckedIn() { 
        return checkedIn; 
    }

    public void checkIn() {
        this.checkedIn = true;
    }
}
