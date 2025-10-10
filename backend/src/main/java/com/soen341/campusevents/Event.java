package com.soen341.campusevents;

import java.util.Date;

public class Event {

    private String eventId;
    private String eventTitle;
    private String eventLocation;
    private String eventOrganization;
    private String eventCategory;
    private Date eventDate;
    private int eventCapacity;


   public Event() {}


// Get and Set Functions

    public String getEventId() {
       return eventId;
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

    public void setEventId(String eventId) {
        this.eventId = eventId;
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


    }
}



