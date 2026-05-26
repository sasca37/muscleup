package com.healthtracker.api.market.service;

public class MarketQuoteException extends RuntimeException {

    public MarketQuoteException(String message) {
        super(message);
    }

    public MarketQuoteException(String message, Throwable cause) {
        super(message, cause);
    }
}
