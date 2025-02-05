*ContractTableRow.tsx* 
<TableCell>{contract.tad_project_number}</TableCell>
<TableCell>{contract.contract_number}</TableCell>
<TableCell>{contract.prime_contractor}</TableCell>
<TableCell className="text-right">{formatCurrency(contract.original_amount)}</TableCell>
<TableCell className="text-right">{contract.dbe_percentage}%</TableCell>
<TableCell>{formatDate(contract.created_at)}</TableCell>
<TableCell className="text-center">
  <Select value={contract.final_report ? "yes" : "no"} onValueChange={(value) => updateFinalReport(contract.id, value === "yes")}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="yes">Yes</SelectItem>
      <SelectItem value="no">No</SelectItem>
    </SelectContent>
  </Select>
</TableCell>
<TableCell className="text-right">
  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
    <Button variant="ghost" size="sm" onClick={() => handleDeleteContract(contract.id)}>
      <Trash2 className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="sm" onClick={() => handleEditContract(contract.id)}>
      <Edit2 className="h-4 w-4" />
    </Button>
  </div>
</TableCell>
