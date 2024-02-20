from django.core.management import call_command
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import BlastAddress
from .serializers import AddressSerializer, BlastAddressSerializer
from .subgraph import getLeaderboard


class BlastAddressViewSet(viewsets.ModelViewSet):
    queryset = BlastAddress.objects.all()
    serializer_class = BlastAddressSerializer


class LeaderboardView(APIView):
    def get(self, request, format=None):
        serializer = AddressSerializer(data=request.query_params)
        if serializer.is_valid():
            address = serializer.validated_data["address"]
            leaderboard = getLeaderboard(address)
            return Response(leaderboard)
        else:
            return Response(serializer.errors, status=400)


@api_view(['GET'])
def update_top_endpoint(request):
    call_command("update_top")
    return Response({"message": "Update top command triggered"})
