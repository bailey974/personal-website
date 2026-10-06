from django.apps import AppConfig


class PizzaordConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pizzaOrd'

class MyAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'myapp'

    def ready(self):
        import myapp.signals