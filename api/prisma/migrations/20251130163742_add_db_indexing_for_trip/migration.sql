-- CreateIndex
CREATE INDEX "trips_route_id_departure_time_idx" ON "trips"("route_id", "departure_time");

-- CreateIndex
CREATE INDEX "trips_departure_time_idx" ON "trips"("departure_time");

-- CreateIndex
CREATE INDEX "trips_base_price_idx" ON "trips"("base_price");

-- CreateIndex
CREATE INDEX "trips_status_idx" ON "trips"("status");
