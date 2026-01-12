from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Category, Product, ProductVariant, Attribute, ProductAttribute
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductDetailSerializer,
    ProductVariantSerializer,
    AttributeSerializer,
    ProductAttributeSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related("category")
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductSerializer


class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all().select_related("product")
    serializer_class = ProductVariantSerializer
    permission_classes = [AllowAny]


class AttributeViewSet(viewsets.ModelViewSet):
    queryset = Attribute.objects.all()
    serializer_class = AttributeSerializer
    permission_classes = [AllowAny]


class ProductAttributeViewSet(viewsets.ModelViewSet):
    queryset = ProductAttribute.objects.all().select_related("product", "attribute")
    serializer_class = ProductAttributeSerializer
    permission_classes = [AllowAny]
