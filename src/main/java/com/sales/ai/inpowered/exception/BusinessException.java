package com.sales.ai.inpowered.exception;

/** A request that is well formed but breaks a business rule. */
public class BusinessException extends RuntimeException {

	public BusinessException(String message) {
		super(message);
	}

}
