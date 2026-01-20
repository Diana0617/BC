import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import ConsentTemplateEditor from '../components/consent/ConsentTemplateEditor';
import {
  fetchConsentTemplates,
  createConsentTemplate,
  updateConsentTemplate,
  deleteConsentTemplate
} from '@shared/store/slices/consentSlice';
import { loadBranding } from '@shared/store/slices/businessConfigurationSlice';
import { formatInTimezone } from '../utils/timezone';

const ConsentTemplatesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const businessId = useSelector(state => state.auth.user?.businessId);
  const business = useSelector(state => state.auth.user?.business);
  const currentBusiness = useSelector(state => state.business?.currentBusiness);
  const timezone = currentBusiness?.timezone || business?.timezone || 'America/Bogota';
  const branches = useSelector(state => state.auth.user?.branches || []);
  const { templates, loading, error } = useSelector(state => state.consent);
  const { branding, loading: brandingLoading } = useSelector(state => state.businessConfiguration);

  // Ref para rastrear si ya se intentó cargar el branding
  const brandingLoadedRef = useRef(false);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (businessId) {
      loadTemplates();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  // Cargar branding del negocio (para logo y colores) - solo una vez
  useEffect(() => {
    if (businessId && !branding && !brandingLoading && !brandingLoadedRef.current) {
      brandingLoadedRef.current = true;
      dispatch(loadBranding(businessId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const loadTemplates = () => {
    dispatch(fetchConsentTemplates({ 
      businessId,
      params: { activeOnly: activeFilter === 'active' }
    }));
  };

  const handleCreate = () => {
    console.log('📋 Business object:', business);
    console.log('📋 Business name:', business?.name);
    console.log('📋 Business phone:', business?.phone);
    console.log('📋 Business address:', business?.address);
    console.log('📋 Business email:', business?.email);
    setSelectedTemplate(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };

  const handleSave = async (templateData) => {
    try {
      if (selectedTemplate) {
        await dispatch(updateConsentTemplate({
          businessId,
          templateId: selectedTemplate.id,
          data: templateData
        })).unwrap();
      } else {
        await dispatch(createConsentTemplate({
          businessId,
          data: templateData
        })).unwrap();
      }
      
      loadTemplates();
      setIsEditorOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm('¿Estás seguro de desactivar esta plantilla? Las firmas existentes no se verán afectadas.')) {
      return;
    }

    try {
      await dispatch(deleteConsentTemplate({
        businessId,
        templateId,
        hardDelete: false
      })).unwrap();
      
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert(error || 'Error al eliminar la plantilla');
    }
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
  };

  const closePreview = () => {
    setPreviewTemplate(null);
  };

  // Filtrar plantillas
  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || template.category === categoryFilter;
    
    const matchesActive = activeFilter === 'all' || 
      (activeFilter === 'active' && template.isActive) ||
      (activeFilter === 'inactive' && !template.isActive);

    return matchesSearch && matchesCategory && matchesActive;
  }) || [];

  const categories = [
    { value: '', label: 'Todas las categorías' },
    { value: 'ESTETICO', label: 'Estético' },
    { value: 'MEDICO', label: 'Médico' },
    { value: 'DEPILACION', label: 'Depilación' },
    { value: 'TATUAJE', label: 'Tatuaje' },
    { value: 'MASAJES', label: 'Masajes' },
    { value: 'OTRO', label: 'Otro' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <button
                onClick={() => navigate('/business/profile')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Volver
              </button>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                Plantillas de Consentimiento
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona las plantillas de consentimiento informado para tus procedimientos
              </p>
            </div>
            
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
            >
              <PlusIcon className="h-5 w-5" />
              Nueva Plantilla
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <div className="relative">
                  <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filter */}
              <div>
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas</option>
                  <option value="active">Activas</option>
                  <option value="inactive">Inactivas</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Templates Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No hay plantillas
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || categoryFilter 
                    ? 'No se encontraron plantillas con los filtros aplicados'
                    : 'Comienza creando tu primera plantilla de consentimiento'
                  }
                </p>
                {!searchTerm && !categoryFilter && (
                  <button
                    onClick={handleCreate}
                    className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Crear Primera Plantilla
                  </button>
                )}
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-2 ${
                    template.isActive ? 'border-green-200' : 'border-gray-200'
                  }`}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {template.name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-500 font-mono">
                            {template.code}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            v{template.version}
                          </span>
                        </div>
                      </div>
                      
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        template.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {template.isActive ? 'Activa' : 'Inactiva'}
                      </div>
                    </div>

                    {/* Category */}
                    {template.category && (
                      <div className="mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {template.category}
                        </span>
                      </div>
                    )}

                    {/* Content Preview */}
                    <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200 max-h-24 overflow-hidden">
                      <p className="text-xs text-gray-600 line-clamp-3">
                        {template.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                      <div>
                        Creada: {formatInTimezone(template.createdAt, timezone, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      {template.updatedAt !== template.createdAt && (
                        <div>
                          Actualizada: {formatInTimezone(template.updatedAt, timezone, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePreview(template)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                        title="Vista previa"
                      >
                        <EyeIcon className="h-4 w-4" />
                        Ver
                      </button>
                      
                      <button
                        onClick={() => handleEdit(template)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        title="Editar"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        Editar
                      </button>
                      
                      {template.isActive && (
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm"
                          title="Desactivar"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Stats */}
        {!loading && filteredTemplates.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Mostrando {filteredTemplates.length} de {templates?.length || 0} plantillas
              </span>
              <span>
                {templates?.filter(t => t.isActive).length || 0} activas • {' '}
                {templates?.filter(t => !t.isActive).length || 0} inactivas
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <ConsentTemplateEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedTemplate(null);
        }}
        onSave={handleSave}
        template={selectedTemplate}
        businessId={businessId}
        businessName={business?.name || ''}
        businessPhone={business?.phone || ''}
        businessAddress={business?.address || ''}
        businessEmail={business?.email || ''}
        branches={branches}
        branding={{
          logo: business?.logo || business?.settings?.branding?.logo || branding?.logo
        }}
      />

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30" onClick={closePreview}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {previewTemplate.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {previewTemplate.code} • v{previewTemplate.version}
                  </p>
                </div>
                <button
                  onClick={closePreview}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border">
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewTemplate.content }}
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    handleEdit(previewTemplate);
                    closePreview();
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Editar Plantilla
                </button>
                <button
                  onClick={closePreview}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentTemplatesPage;
