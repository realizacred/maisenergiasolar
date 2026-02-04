import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeads } from "@/hooks/useLeads";
import { LeadsTable, LeadFilters, LeadViewDialog, LeadDeleteDialog } from "@/components/admin/leads";
import { ConvertLeadToClientDialog } from "@/components/leads/ConvertLeadToClientDialog";
import { PendingDocumentationWidget, FollowUpNotifications } from "@/components/admin/widgets";
import type { Lead } from "@/types/lead";

export function LeadsView() {
  const { leads, statuses, toggleVisto, deleteLead, filters, fetchLeads } = useLeads();
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVisto, setFilterVisto] = useState("nao_visto");
  const [filterVendedor, setFilterVendedor] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);

  useEffect(() => {
    let filtered = leads.filter(
      (lead) =>
        lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.telefone.includes(searchTerm) ||
        lead.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.vendedor &&
          lead.vendedor.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (filterVisto === "visto") {
      filtered = filtered.filter((lead) => lead.visto_admin);
    } else if (filterVisto === "nao_visto") {
      filtered = filtered.filter((lead) => !lead.visto_admin);
    }

    if (filterVendedor !== "todos") {
      filtered = filtered.filter((lead) => lead.vendedor === filterVendedor);
    }

    if (filterEstado !== "todos") {
      filtered = filtered.filter((lead) => lead.estado === filterEstado);
    }

    setFilteredLeads(filtered);
  }, [searchTerm, leads, filterVisto, filterVendedor, filterEstado]);

  const handleClearFilters = () => {
    setFilterVisto("todos");
    setFilterVendedor("todos");
    setFilterEstado("todos");
  };

  const handleDelete = async () => {
    if (leadToDelete) {
      await deleteLead(leadToDelete.id);
      setIsDeleteOpen(false);
      setLeadToDelete(null);
    }
  };

  const handleLeadFromWidget = (lead: Lead) => {
    setLeadToConvert(lead);
    setIsConvertOpen(true);
  };

  return (
    <>
      {/* Notification Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <PendingDocumentationWidget onLeadClick={handleLeadFromWidget} />
        <FollowUpNotifications onLeadClick={handleLeadFromWidget} diasAlerta={3} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-brand-blue">Leads Cadastrados</CardTitle>
          </div>
          <LeadFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterVisto={filterVisto}
            onFilterVistoChange={setFilterVisto}
            filterVendedor={filterVendedor}
            onFilterVendedorChange={setFilterVendedor}
            filterEstado={filterEstado}
            onFilterEstadoChange={setFilterEstado}
            vendedores={filters.vendedores}
            estados={filters.estados}
            onClearFilters={handleClearFilters}
          />
        </CardHeader>
        <CardContent>
          <LeadsTable
            leads={filteredLeads}
            statuses={statuses}
            onToggleVisto={toggleVisto}
            onView={(lead) => {
              setSelectedLead(lead);
              setIsViewOpen(true);
            }}
            onDelete={(lead) => {
              setLeadToDelete(lead);
              setIsDeleteOpen(true);
            }}
            onConvert={(lead) => {
              setLeadToConvert(lead);
              setIsConvertOpen(true);
            }}
          />
        </CardContent>
      </Card>

      <LeadViewDialog
        lead={selectedLead}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
      />

      <LeadDeleteDialog
        lead={leadToDelete}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
      />

      <ConvertLeadToClientDialog
        lead={leadToConvert}
        open={isConvertOpen}
        onOpenChange={setIsConvertOpen}
        onSuccess={fetchLeads}
      />
    </>
  );
}
