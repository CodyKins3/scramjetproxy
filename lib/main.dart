import 'dart:io';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as io;
import 'package:http/http.dart' as http;

void main() async {
  final handler = (Request request) async {
    final targetUrl = request.url.queryParameters['url'];
    if (targetUrl == null) {
      return Response(400, body: 'Missing ?url parameter');
    }

    try {
      final response = await http.get(Uri.parse(targetUrl));
      return Response.ok(
        response.body,
        headers: {'content-type': response.headers['content-type'] ?? 'text/html'},
      );
    } catch (e) {
      return Response.internalServerError(body: 'Error: $e');
    }
  };

  final port = int.parse(Platform.environment['PORT'] ?? '8080');
  final server = await io.serve(handler, '0.0.0.0', port);
  print('Server running on port ${server.port}');
}
