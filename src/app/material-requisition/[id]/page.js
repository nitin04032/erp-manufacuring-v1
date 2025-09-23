"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function RequisitionDetail() {
  const { id } = useParams();
  const [requisition, setRequisition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/material-requisition/${id}`).then(async r=>{
      if (r.ok) {
        setRequisition(await r.json());
      } else {
        console.error("Failed to fetch");
      }
    }).catch(console.error).finally(()=>setLoading(false));
  }, [id]);

  if (loading) return <div className="container py-5">Loading...</div>;
  if (!requisition) return <div className="container py-5">Not found</div>;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3"><i className="bi bi-clipboard-data text-primary"></i> Requisition {requisition.requisition_no}</h1>
        <div>
          <Link href="/material-requisition" className="btn btn-outline-secondary me-2">Back</Link>
          {requisition.status === "draft" && <Link href={`/material-requisition/${id}/edit`} className="btn btn-primary">Edit</Link>}
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <p><strong>Requested By:</strong> {requisition.requested_by}</p>
          <p><strong>Production Order:</strong> {requisition.production_order_no || "-"}</p>
          <p><strong>Date:</strong> {new Date(requisition.requisition_date).toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span className={`badge bg-${requisition.status==="draft"?"secondary":requisition.status==="submitted"?"info":requisition.status==="approved"?"success":"danger"}`}>{requisition.status}</span></p>
          <p><strong>Remarks:</strong> {requisition.remarks || "-"}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Items</div>
        <div className="card-body">
          {requisition.items?.length > 0 ? (
            <table className="table">
              <thead><tr><th>Code</th><th>Name</th><th>Qty</th><th>UOM</th></tr></thead>
              <tbody>
                {requisition.items.map(it => (
                  <tr key={it.id}>
                    <td>{it.item_code}</td>
                    <td>{it.item_name}</td>
                    <td>{Number(it.qty).toFixed(3)}</td>
                    <td>{it.uom || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>No items</p>}
        </div>
      </div>
    </div>
  );
}
