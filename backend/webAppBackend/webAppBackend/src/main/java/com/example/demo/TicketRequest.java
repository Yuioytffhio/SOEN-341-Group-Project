package com.example.demo;

import java.util.Date;

// Create a seperate file for ticket claiming, to avoid modifying
// event.java info as well extra studentId field

public class TicketRequest {
    private String eventID;
    private String studentId;
    private String eventTitle;
    private String eventLocation;
    private String eventOrganization;
    private String eventCategory;
    private Date eventDate;
    private int eventCapacity;

    public TicketRequest() {}

    // Get and Set Functions

    public String getEventID() {
        return eventID;
    }
    
    public void setEventID(String eventID) {
        this.eventID = eventID;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getEventTitle() {
        return eventTitle;
    }

    public void setEventTitle(String eventTitle) {
        this.eventTitle = eventTitle;
    }

    public String getEventLocation() {
        return eventLocation;
    }

    public void setEventLocation(String eventLocation) {
        this.eventLocation = eventLocation;
    }

    public String getEventOrganization() {
        return eventOrganization;
    }

    public void setEventOrganization(String eventOrganization) {
        this.eventOrganization = eventOrganization;
    }

    public String getEventCategory() {
        return eventCategory;
    }

    public void setEventCategory(String eventCategory) {
        this.eventCategory = eventCategory;
    }

    public Date getEventDate() {
        return eventDate;
    }

    public void setEventDate(Date eventDate) {
        this.eventDate = eventDate;
    }

    public int getEventCapacity() {
        return eventCapacity;
    }

    public void setEventCapacity(int eventCapacity) {
        this.eventCapacity = eventCapacity;
    }
}