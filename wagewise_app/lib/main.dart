import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

const String kProductionUrl = 'https://moneybuddy-jet.vercel.app';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUIOverlayStyle(
      statusBarColor: Color(0xFF080d19),
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF080d19),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const WageWiseApp());
}

class WageWiseApp extends StatelessWidget {
  const WageWiseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WageWise',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF06B6D4),
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF080d19),
        useMaterial3: true,
      ),
      home: const WageWiseSplash(),
    );
  }
}

class WageWiseSplash extends StatefulWidget {
  const WageWiseSplash({super.key});

  @override
  State<WageWiseSplash> createState() => _WageWiseSplashState();
}

class _WageWiseSplashState extends State<WageWiseSplash> {
  bool _ready = false;

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 1500), () {
      if (mounted) setState(() => _ready = true);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_ready) {
      return Scaffold(
        backgroundColor: const Color(0xFF080d19),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  gradient: const LinearGradient(
                    colors: [Color(0xFF06B6D4), Color(0xFF3B82F6), Color(0xFF8B5CF6)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF06B6D4).withValues(alpha: 0.3),
                      blurRadius: 30,
                      spreadRadius: 5,
                    ),
                  ],
                ),
                child: const Center(
                  child: Text('W', style: TextStyle(fontSize: 44, fontWeight: FontWeight.w900, color: Colors.white)),
                ),
              ),
              const SizedBox(height: 24),
              const Text('WageWise', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 8),
              Text(
                'AI Money Coach',
                style: TextStyle(fontSize: 14, color: Colors.white.withValues(alpha: 0.5)),
              ),
            ],
          ),
        ),
      );
    }

    return const WageWiseWebView();
  }
}

class WageWiseWebView extends StatefulWidget {
  const WageWiseWebView({super.key});

  @override
  State<WageWiseWebView> createState() => _WageWiseWebViewState();
}

class _WageWiseWebViewState extends State<WageWiseWebView> {
  late final WebViewController _controller;
  bool _isLoading = true;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF080d19))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) {
            if (mounted) setState(() { _isLoading = true; _hasError = false; });
          },
          onPageFinished: (_) {
            if (mounted) setState(() => _isLoading = false);
          },
          onWebResourceError: (error) {
            if (error.isForMainFrame ?? false) {
              if (mounted) setState(() { _hasError = true; _isLoading = false; });
            }
          },
          onNavigationRequest: (request) {
            final uri = Uri.parse(request.url);
            if (uri.host.contains('accounts.google.com') ||
                uri.host.contains('supabase.co') ||
                uri.host.contains('vercel.app')) {
              return NavigationDecision.navigate;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(kProductionUrl));
  }

  void _retry() {
    setState(() { _hasError = false; _isLoading = true; });
    _controller.loadRequest(Uri.parse(kProductionUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080d19),
      body: SafeArea(
        child: Stack(
          children: [
            WebViewWidget(controller: _controller),
            if (_isLoading)
              const Center(
                child: CircularProgressIndicator(color: Color(0xFF06B6D4), strokeWidth: 2),
              ),
            if (_hasError)
              Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.wifi_off_rounded, size: 48, color: Colors.white.withValues(alpha: 0.3)),
                    const SizedBox(height: 16),
                    Text('No internet connection', style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 16)),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: _retry,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF06B6D4),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                      ),
                      child: const Text('Retry', style: TextStyle(fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
