import 'dart:io';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WageWise',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.emerald),
        useMaterial3: true,
      ),
      home: const WageWiseWebView(),
    );
  }
}

class WageWiseWebView extends StatefulWidget {
  const WageWiseWebView({super.key});

  @override
  State<WageWiseWebView> createState() => _WageWiseWebViewState();
}

class _WageWiseWebViewState extends State<WageWiseWebView> {
  late final WebViewController controller;

  @override
  void initState() {
    super.initState();
    
    // Auto-detect correct localhost for Android vs iOS/Desktop
    final String baseUrl = Platform.isAndroid 
        ? 'http://10.0.2.2:3000' 
        : 'http://localhost:3000';

    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF020617))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {},
          onPageStarted: (String url) {},
          onPageFinished: (String url) {},
          onWebResourceError: (WebResourceError error) {},
          onNavigationRequest: (NavigationRequest request) {
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(baseUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020617),
      body: SafeArea(
        child: WebViewWidget(controller: controller),
      ),
    );
  }
}
