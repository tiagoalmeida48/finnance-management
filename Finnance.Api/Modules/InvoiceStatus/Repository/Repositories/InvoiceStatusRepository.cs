using Dapper;
using Finnance.Api.Modules.Common.Repository;
using Finnance.Api.Modules.InvoiceStatus.Domain.Entities;
using Finnance.Api.Modules.InvoiceStatus.Domain.Interfaces;
using Finnance.Api.Modules.InvoiceStatus.Repository.Models;
using Finnance.Api.Shared;
using System.Text;

namespace Finnance.Api.Modules.InvoiceStatus.Repository.Repositories;

public class InvoiceStatusRepository : BaseRepository<InvoiceStatusEntity, InvoiceStatusMod>, IInvoiceStatusRepository
{
    public List<InvoiceStatusEntity> Search(long invoiceStatus = 0,
                                            string name = null,
                                            bool active = false,
                                            int quantity = 0)
    {
        var sb = new StringBuilder();
        var param = new DynamicParameters();

        sb.Append("SELECT * FROM invoice_status WHERE 1 = 1 ");

        if (invoiceStatus > 0)
        {
            param.Add("invoiceStatus", invoiceStatus);
            sb.Append("AND invoice_status = @invoiceStatus ");
        }

        if (name.IsNotEmpty())
        {
            param.Add("name", name);
            sb.Append("AND name = @name ");
        }

        if (active)
            sb.Append("AND active = TRUE ");

        if (quantity > 0)
        {
            param.Add("quantity", quantity);
            sb.Append("LIMIT @quantity");
        }

        using var con = Conn;
        var model = con.Query<InvoiceStatusMod>(sb.ToString(), param).ToList();
        return MapToEntity(model);
    }
}
