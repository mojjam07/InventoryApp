from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request, 'index.html')

def inventory(request):
    return render(request, 'inventory.html')

def receipt(request):
    return render(request, 'receipt.html')

def sales(request):
    return render(request, 'sales.html')
