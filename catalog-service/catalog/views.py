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
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Product.objects.all().select_related("category")
        category_id = self.request.query_params.get("category_id")
        category_slug = self.request.query_params.get("category_slug")
        if category_id:
            return queryset.filter(category_id=category_id)
        if category_slug:
            return queryset.filter(category__slug=category_slug)
        return queryset

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
