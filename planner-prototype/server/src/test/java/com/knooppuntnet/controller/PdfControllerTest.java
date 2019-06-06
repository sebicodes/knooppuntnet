package com.knooppuntnet.controller;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.knooppuntnet.domain.Route;
import com.knooppuntnet.service.PdfService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(MockitoJUnitRunner.class)
public class PdfControllerTest {

	@Mock
	private PdfService pdfService;

	@InjectMocks
	private PdfController pdfController;

	private MockMvc mockMvc;

	@Before
	public void init() {
		this.mockMvc = MockMvcBuilders.standaloneSetup(pdfController)
				.build();
	}

	@Test
	public void testDownloadPdfFile() throws Exception {
		Route route = new Route();
		ObjectMapper mapper = new ObjectMapper();

		String string = "";

		try {
			string = mapper.writeValueAsString(route);
		} catch (JsonMappingException e) {
			e.printStackTrace();
		}

		this.mockMvc.perform(post("/pdf/cycling/nl")
				.accept(MediaType.APPLICATION_JSON)
				.contentType(MediaType.APPLICATION_JSON_VALUE)
				.content(string))
				.andDo(print())
				.andExpect(status().isOk());
	}
}