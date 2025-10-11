package com.example.demo;

import java.util.Date;

public class Event {

    private String eventid;
    private String eventTitle;
    private String eventLocation;
    private String eventOrganization;
    private String eventCategory;
    private String eventDescription;
    private Date eventDate;
    private int eventCapacity;


   public Event() {}


// Get and Set Functions

    public String getId() {
       return eventid;
    }

    public String getEventTitle() {
        return eventTitle;
    }

    public String getEventLocation() {
        return eventLocation;
    }

    public String getEventOrganization() {
        return eventOrganization;
    }

    public String getEventCategory() {
        return eventCategory;
    }

    public Date getEventDate() {
        return eventDate;
    }

    public int getEventCapacity() {
        return eventCapacity;
    }

    public void seteventId(String id) {
        this.eventid = id;
    }

    public void setEventTitle(String eventTitle) {
        this.eventTitle = eventTitle;
    }

    public void setEventLocation(String eventLocation) {
        this.eventLocation = eventLocation;
    }

    public void setEventOrganization(String eventOrganization) {
        this.eventOrganization = eventOrganization;
    }

    public void setEventCategory(String eventCategory) {
        this.eventCategory = eventCategory;
    }

    public void setEventDate(Date eventDate) {
        this.eventDate = eventDate;
    }

    public void setEventCapacity(int eventCapacity) {
        this.eventCapacity = eventCapacity;
    }

    public String getEventDescription() {
        return eventDescription;
    }

    public void setEventDescription(String eventDescription) {
        this.eventDescription = eventDescription;
    }
}



