from rest_framework import viewsets
from .models import BlastAddress
from .serializers import BlastAddressSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import AddressSerializer
from .subgraph import getLeaderboard


class BlastAddressViewSet(viewsets.ModelViewSet):
    queryset = BlastAddress.objects.all()
    serializer_class = BlastAddressSerializer


class LeaderboardView(APIView):
    def get(self, request, format=None):
        serializer = AddressSerializer(data=request.query_params)
        if serializer.is_valid():
            address = serializer.validated_data['address']
            leaderboard = getLeaderboard(address)
            return Response(leaderboard)
        else:
            return Response(serializer.errors, status=400)