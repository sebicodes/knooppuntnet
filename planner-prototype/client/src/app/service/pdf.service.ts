import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {PdfDocument, Route} from "../model/";
import {Observable} from "rxjs";

@Injectable({
  providedIn: "root"
})
export class PDFService {

  constructor(private http: HttpClient) {
  }

  downloadPDF(language: string, routeType: string, route: Route): Observable<PdfDocument> {
    return this.http.post<PdfDocument>(`/api/pdf/${routeType}/${language}`, route);
  }
}