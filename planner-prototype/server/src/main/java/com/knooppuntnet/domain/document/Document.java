package com.knooppuntnet.domain.document;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Document {

	@JsonProperty("_id")
	private String _id;
	@JsonProperty("_rev")
	private String _rev;
	@JsonProperty("route")
	private Route route;

	public Document() {
	}

	public String get_id() {
		return _id;
	}

	public void set_id(String _id) {
		this._id = _id;
	}

	public String get_rev() {
		return _rev;
	}

	public void set_rev(String _rev) {
		this._rev = _rev;
	}

	public Route getRoute() {
		return route;
	}

	public void setRoute(Route routeObject) {
		this.route = routeObject;
	}
}

