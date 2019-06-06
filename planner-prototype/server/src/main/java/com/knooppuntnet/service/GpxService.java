package com.knooppuntnet.service;

import com.knooppuntnet.domain.Route;
import com.knooppuntnet.domain.Section;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;

import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;

@Service
public interface GpxService {

	void createGpx(Route route, HttpServletResponse response);

	Document getDocumentForRoute(Route route) throws ParserConfigurationException;

	Document getDocumentForSection(Section section) throws ParserConfigurationException;
}
