from django.urls import path
from . import views
from .views import select_option, order_success
from .views import custom_login_view
from django.contrib.auth.views import LoginView, LogoutView

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('logout/', views.logout_user, name='logout'),
    path('home/', views.home_view, name='home'),
    path('login/', custom_login_view, name='custom_login'),
    path("logout/", LogoutView.as_view(next_page="login"), name="logout"),
    path("select/", select_option, name="select_option"),
    path("order-success/", order_success, name="order_success"),
    path('', views.index, name='index'),
    path('check-login/', views.check_login_status, name='check_login'),
    path('index/', views.index, name='index'),
    path('select/', views.select_option, name='select_option'),
    path('order-details/', views.order_details, name='order_details'),
    path('order-success/', views.order_success, name='order_success'),
    path('my-orders/', views.my_orders, name='my_orders'),
]
