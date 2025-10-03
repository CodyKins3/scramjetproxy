import 'dart:io';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as io;
import 'package:http/http.dart' as http;

void main() async {
  final handler = (Request request) async {
    final urlParam = request.url.queryParameters['url'];

    // If no URL provided, serve the HTML form
    if (urlParam == null || urlParam.isEmpty) {
      final html = await File('lib/index.html').readAsString();
      return Response.ok(html, headers: {'content-type': 'text/html'});
    }

    // Validate URL starts with http:// or https://
    if (!urlParam.startsWith('http://') && !urlParam.startsWith('https://')) {
      return Response(400, body: 'Invalid URL. Must start with http:// or https://');
    }

    try {
      final response = await http.get(Uri.parse(urlParam));

      // Return the response from the target site
      return Response.ok(
        response.body,
        headers: {'content-type': response.headers['content-type'] ?? 'text/html'},
      );
    } catch (e) {
      return Response.internalServerError(body: 'Error fetching URL: $e');
    }
  };

  final port = int.parse(Platform.environment['PORT'] ?? '8080');
  final server = await io.serve(handler, '0.0.0.0', port);
  print('Server running on port ${server.port}');
}
