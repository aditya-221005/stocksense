import { Request, Response } from 'express';
import { ProductService } from '../services/product.service.js';
import { asyncHandler } from '../utils/async-handler.js';

export class ProductController {
  static getProducts = asyncHandler(async (req: Request, res: Response) => {
    const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;

    const products = await ProductService.getAllProducts({
      categoryId,
      search,
    });
    res.json(products);
  });

  static getProductById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const product = await ProductService.getProductById(id);
    res.json(product);
  });

  static createProduct = asyncHandler(async (req: Request, res: Response) => {
    const { name, sku, categoryId, uomId, unitCost, initialStock, defaultWarehouseId, defaultLocationId } = req.body;
    if (!name || !sku || !uomId || unitCost === undefined) {
      return res.status(400).json({ error: 'Name, SKU, uomId, and unitCost are required.' });
    }
    const product = await ProductService.createProduct({
      name,
      sku,
      categoryId,
      uomId,
      unitCost: Number(unitCost),
      initialStock: initialStock !== undefined ? Number(initialStock) : undefined,
      defaultWarehouseId,
      defaultLocationId,
    });
    res.status(201).json(product);
  });

  static updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const product = await ProductService.updateProduct(id, req.body);
    res.json(product);
  });

  static deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await ProductService.deleteProduct(id);
    res.json({ message: 'Product deleted successfully.' });
  });

  // Categories
  static getCategories = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await ProductService.getCategories();
    res.json(categories);
  });

  static createCategory = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required.' });
    const category = await ProductService.createCategory(name);
    res.status(201).json(category);
  });

  // UOMs
  static getUoms = asyncHandler(async (_req: Request, res: Response) => {
    const uoms = await ProductService.getUoms();
    res.json(uoms);
  });

  static createUom = asyncHandler(async (req: Request, res: Response) => {
    const { name, symbol } = req.body;
    if (!name || !symbol) return res.status(400).json({ error: 'Name and symbol are required.' });
    const uom = await ProductService.createUom(name, symbol);
    res.status(201).json(uom);
  });
}
