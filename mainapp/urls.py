from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('index/', views.index, name='index'),
    path('inventory/', views.inventory, name='inventory'),
    path('receipt/', views.receipt, name='receipt'),
    path('sales/', views.sales, name='sales')
]
