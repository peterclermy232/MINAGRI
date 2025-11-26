// mock-backend.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class MockBackendInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('Interceptor - Request:', req.url, req.method);

    // Remove request_type from body before sending to in-memory API
    if (req.body && req.body.request_type) {
      const modifiedBody = { ...req.body };
      delete modifiedBody.request_type;
      req = req.clone({ body: modifiedBody });
    }

    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          console.log('Interceptor - Response:', event.url, event.body);

          // Transform response to match API format
          if (req.url.includes('/api/v1/')) {
            const body = event.body;

            // For collection responses (GET all)
            if (Array.isArray(body)) {
              const transformedResponse = {
                response_code: 200,
                offset: 0,
                results: body,
                page_size: body.length,
              };
              console.log('Transformed to collection response:', transformedResponse);
              return event.clone({
                body: transformedResponse,
              });
            }

            // For single item responses (POST, PUT)
            if (body && typeof body === 'object' && !body.response_code) {
              // Check if it's a POST response (newly created item)
              if (req.method === 'POST') {
                const transformedResponse = {
                  response_code: 201,
                  message: 'Resource created successfully',
                  data: body,
                };
                console.log('Transformed POST response:', transformedResponse);
                return event.clone({
                  body: transformedResponse,
                });
              }

              // Check if it's a PUT response (updated item)
              if (req.method === 'PUT') {
                const transformedResponse = {
                  response_code: 200,
                  message: 'Resource updated successfully',
                  data: body,
                };
                console.log('Transformed PUT response:', transformedResponse);
                return event.clone({
                  body: transformedResponse,
                });
              }
            }
          }
        }
        return event;
      })
    );
  }
}
