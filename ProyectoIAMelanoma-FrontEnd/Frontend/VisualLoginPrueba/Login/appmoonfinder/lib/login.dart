import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Login App',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const LoginPage(),
    );
  }
}

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _usuarioController = TextEditingController();
  final TextEditingController _contrasenaController = TextEditingController();
  bool _recordarContrasena = false;

  void _iniciarSesion() {
    String usuario = _usuarioController.text;
    String contrasena = _contrasenaController.text;

    // Aquí puedes agregar tu lógica de autenticación
    if (usuario == 'admin' && contrasena == '1234') {
      // Acceso concedido
      showDialog(
        context: context,
        builder:
            (_) => const AlertDialog(
              title: Text('¡Éxito!'),
              content: Text('Inicio de sesión correcto.'),
            ),
      );
    } else {
      // Acceso denegado
      showDialog(
        context: context,
        builder:
            (_) => const AlertDialog(
              title: Text('Error'),
              content: Text('Usuario o contraseña incorrectos.'),
            ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 180, // Aumenta la altura del AppBar para más espacio
        title: Column(
          children: [
            // "Find out" centrado en la parte superior
            Padding(
              padding: const EdgeInsets.only(top: 40.0), // Más espacio arriba
              child: RichText(
                text: TextSpan(
                  text: 'Find out',
                  style: TextStyle(
                    fontSize: 35,
                    fontWeight: FontWeight.w400,
                    color: Colors.black,
                  ),
                ),
              ),
            ),
            // "MOLE" debajo de "Find out" con un pequeño desplazamiento a la derecha
            Padding(
              padding: const EdgeInsets.only(
                top: 8.0,
                left: 45.0,
              ), // Desplazar "MOLE"
              child: RichText(
                text: TextSpan(
                  text: 'MOLE',
                  style: TextStyle(
                    fontSize: 55,
                    fontWeight: FontWeight.w800,
                    color: Colors.blue,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      body: Container(
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage('assets/images/fondoLogin.png'),
            fit: BoxFit.cover,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextField(
                controller: _usuarioController,
                decoration: const InputDecoration(
                  labelText: 'Usuario',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.perm_identity),
                  focusedBorder: OutlineInputBorder(
                    borderSide: BorderSide(color: Colors.blue, width: 2.0),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _contrasenaController,
                decoration: const InputDecoration(
                  labelText: 'Contraseña',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.lock),
                  focusedBorder: OutlineInputBorder(
                    borderSide: BorderSide(color: Colors.blue, width: 2.0),
                  ),
                ),
                obscureText: true,
              ),
              CheckboxListTile(
                title: const Text('Recordar contraseña'),
                value: _recordarContrasena,
                onChanged: (bool? value) {
                  setState(() {
                    _recordarContrasena = value ?? false;
                  });
                },
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: _iniciarSesion,
                child: const Text('Iniciar Sesión'),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () {
                  showDialog(
                    context: context,
                    builder:
                        (_) => const AlertDialog(
                          title: Text('Recupera tu password'),
                          content: Text(
                            'Te enviaremos un correo para recuperar tu contraseña.',
                          ),
                        ),
                  );
                },
                child: const Text(
                  '¿Olvidaste tu contraseña?',
                  style: TextStyle(color: Colors.blue),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
